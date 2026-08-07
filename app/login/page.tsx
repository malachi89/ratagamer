import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>🎮 RataGamer</h1>
        <p className="sub">Diario de gaming privado</p>
        <LoginForm />
      </div>
    </div>
  );
}
