import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z
      .number()
      .int("Jumlah harus bilangan bulat")
      .positive("Jumlah harus lebih dari 0"),
    categoryId: z.string(),
    walletId: z.string().min(1, "Pilih dompet asal"),
    toWalletId: z.string().optional(),
    note: z.string().optional(),
    date: z.string().min(1, "Tanggal diperlukan"),
    paymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "transfer" && (!data.categoryId || data.categoryId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pilih kategori transaksi",
        path: ["categoryId"],
      });
    }
    if (data.type === "transfer") {
      if (!data.toWalletId || data.toWalletId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pilih dompet tujuan",
          path: ["toWalletId"],
        });
      } else if (data.toWalletId === data.walletId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dompet tujuan tidak boleh sama dengan dompet asal",
          path: ["toWalletId"],
        });
      }
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;

