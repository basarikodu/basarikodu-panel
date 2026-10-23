import { redirect } from "next/navigation";

// Eski /giris adresi: giriş seçimi ana sayfada
export default function LoginRedirect() {
  redirect("/");
}
