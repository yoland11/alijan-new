import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useNavigate, Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false, refetchOnWindowFocus: false },
  });
  const loginMutation = useLogin();

  if (user) {
    return <Navigate to={user.role === "owner" || user.role === "admin" || user.role === "staff" ? "/admin" : "/delivery"} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          toast.success("تم تسجيل الدخول بنجاح");
          void queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
          queryClient.setQueryData(getGetMeQueryKey(), data.user);

          if (data.user.role === "owner" || data.user.role === "admin" || data.user.role === "staff") {
            navigate("/admin", { replace: true });
          } else if (data.user.role === "delivery") {
            navigate("/delivery", { replace: true });
          } else {
            navigate("/account", { replace: true });
          }
        },
        onError: () => {
          toast.error("فشل تسجيل الدخول. يرجى التأكد من البيانات المدخلة.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/50">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary mb-2 tracking-wider">مجموعة علي جان</h1>
            <p className="text-muted-foreground">تسجيل الدخول لحسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-4 pr-12 h-14 bg-background/50 border-border focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-4 pr-12 h-14 bg-background/50 border-border focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
              className="w-full h-14 text-lg font-bold mt-8 shadow-[0_0_20px_rgba(201,168,76,0.1)] hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-shadow"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                "دخول"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
