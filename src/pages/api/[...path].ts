import type { NextApiRequest, NextApiResponse } from "next";
import cookieParser from "cookie-parser";
import express from "express";
import pinoHttp from "pino-http";
import apiRouter from "@/server/api/routes";
import { attachAuthUser, protectApiRoutes } from "@/server/api/middlewares/auth";

const app = express();

app.disable("x-powered-by");
app.use(pinoHttp({ quietReqLogger: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(attachAuthUser);
app.use(protectApiRoutes);
app.use(apiRouter);

function normalizeApiUrl(req: NextApiRequest): void {
  const path = req.query.path;
  const segments = Array.isArray(path) ? path : path ? [path] : [];
  const queryIndex = req.url?.indexOf("?") ?? -1;
  const query = queryIndex >= 0 ? req.url?.slice(queryIndex) : "";

  req.url = `/${segments.map(encodeURIComponent).join("/")}${query ?? ""}`;
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  normalizeApiUrl(req);
  return app(req, res);
}
