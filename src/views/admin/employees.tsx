import { useState } from "react";
import { motion } from "framer-motion";
import {
  getListEmployeesQueryKey,
  useCreateEmployee,
  useDeleteEmployee,
  useListEmployees,
  useUpdateEmployee,
  type Employee,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, User, ShieldCheck, Trash2, Pencil, Power } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

interface EmployeeForm {
  fullName: string;
  username: string;
  role: string;
  password: string;
  isActive: boolean;
  permissions: string[];
}

const roleLabels: Record<string, string> = {
  owner: "مدير أساسي",
  admin: "مدير",
  staff: "موظف",
  delivery: "مندوب توصيل",
};

const permissionLabels = [
  ["view_orders", "عرض الطلبات"],
  ["create_order", "إضافة طلب"],
  ["edit_order", "تعديل طلب"],
  ["delete_order", "حذف طلب"],
  ["change_order_status", "تغيير حالة الطلب"],
  ["manage_products", "إدارة المنتجات"],
  ["manage_services", "إدارة الخدمات"],
  ["manage_customers", "إدارة العملاء"],
  ["manage_inventory", "إدارة المخزون"],
  ["manage_accounting", "إدارة الحسابات"],
  ["create_receipt_voucher", "سند قبض"],
  ["create_payment_voucher", "سند صرف"],
  ["create_transfer_voucher", "سند بين حسابات"],
  ["manage_delivery", "إدارة التوصيل"],
  ["manage_portfolio", "إدارة أعمالنا"],
  ["manage_reviews", "إدارة التقييمات"],
  ["manage_settings", "إدارة الإعدادات"],
  ["manage_employees", "إدارة الموظفين"],
  ["print_invoices", "طباعة الفواتير"],
  ["view_dashboard", "عرض الإحصائيات"],
] as const;

const emptyForm: EmployeeForm = {
  fullName: "",
  username: "",
  role: "staff",
  password: "",
  isActive: true,
  permissions: [],
};

export default function AdminEmployees() {
  const { data: employees, isLoading } = useListEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<EmployeeForm>({
    defaultValues: emptyForm,
  });
  const selectedPermissions = toSafeArray<string>(watch("permissions"));
  const selectedRole = watch("role");
  const isOwnerEdit = editingEmployee?.username === "admin" && editingEmployee.role === "owner";
  const safeEmployees = toSafeArray<Employee>(employees);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });

  const openCreate = () => {
    setEditingEmployee(null);
    reset(emptyForm);
    setShowForm(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      fullName: employee.fullName,
      username: employee.username,
      role: employee.role,
      password: "",
      isActive: employee.isActive,
      permissions: toSafeArray<string>((employee as any).permissions),
    });
    setShowForm(true);
  };

  const onSubmit = (data: EmployeeForm) => {
    const payload = {
      fullName: data.fullName,
      username: data.username,
      role: data.role,
      isActive: data.isActive,
      permissions: toSafeArray<string>(data.permissions),
      ...(data.password ? { password: data.password } : {}),
    };

    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id, data: payload },
        {
          onSuccess: () => {
            invalidate();
            reset(emptyForm);
            setEditingEmployee(null);
            setShowForm(false);
          },
        },
      );
      return;
    }

    createEmployee.mutate(
      { data: { ...payload, password: data.password } },
      {
        onSuccess: () => {
          invalidate();
          reset(emptyForm);
          setShowForm(false);
        },
      },
    );
  };

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setValue(
        "permissions",
        selectedPermissions.filter((item) => item !== permission),
      );
      return;
    }
    setValue("permissions", [...selectedPermissions, permission]);
  };

  const toggleActive = (employee: Employee) => {
    updateEmployee.mutate(
      { id: employee.id, data: { isActive: !employee.isActive } },
      { onSuccess: invalidate },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">إدارة الموظفين</motion.h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> موظف جديد
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">الاسم</label>
              <input {...register("fullName", { required: true })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">اسم المستخدم</label>
              <input {...register("username", { required: true })} disabled={isOwnerEdit}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">كلمة المرور</label>
              <input {...register("password", { required: !editingEmployee })} type="password"
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder={editingEmployee ? "اتركها فارغة إذا لا تريد تغييرها" : ""} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">الدور</label>
              <select {...register("role")} disabled={isOwnerEdit}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isActive")} disabled={isOwnerEdit} />
            الحساب فعال
          </label>

          <div>
            <p className="text-sm font-bold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> الصلاحيات</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissionLabels.map(([permission, label]) => (
                <label key={permission} className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm ${isOwnerEdit || selectedRole === "owner" ? "opacity-60" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selectedRole === "owner" || selectedPermissions.includes(permission)}
                    disabled={isOwnerEdit || selectedRole === "owner"}
                    onChange={() => togglePermission(permission)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {editingEmployee ? "حفظ التعديل" : "إضافة"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingEmployee(null); reset(emptyForm); }} className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50">إلغاء</button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeEmployees.map((employee, index) => {
            const protectedOwner = employee.username === "admin" && employee.role === "owner";
            const employeePermissions = toSafeArray<string>((employee as any).permissions);
            return (
              <motion.div key={employee.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{employee.fullName}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">{employee.username}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{roleLabels[employee.role] ?? employee.role}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${employee.isActive ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                        {employee.isActive ? "فعال" : "معطل"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{employeePermissions.length} صلاحية مفعلة</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openEdit(employee)} className="flex items-center gap-1 border border-border px-3 py-1.5 rounded text-xs hover:border-primary">
                    <Pencil className="w-3 h-3" /> تعديل
                  </button>
                  <button onClick={() => toggleActive(employee)} disabled={protectedOwner}
                    className="flex items-center gap-1 border border-border px-3 py-1.5 rounded text-xs hover:border-primary disabled:opacity-50">
                    <Power className="w-3 h-3" /> {employee.isActive ? "تعطيل" : "تفعيل"}
                  </button>
                  <button onClick={() => deleteEmployee.mutate({ id: employee.id }, { onSuccess: invalidate })} disabled={protectedOwner}
                    className="flex items-center gap-1 border border-destructive/30 text-destructive px-3 py-1.5 rounded text-xs hover:bg-destructive/10 disabled:opacity-50">
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
              </motion.div>
            );
          })}
          {safeEmployees.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا يوجد موظفون</div>
          )}
        </div>
      )}
    </div>
  );
}
