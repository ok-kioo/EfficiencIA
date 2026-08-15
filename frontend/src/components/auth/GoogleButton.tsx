/* import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";

export function GoogleButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!clientId) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          if (!idToken) return;
          try {
            await loginWithGoogle(idToken);
            navigate({ to: "/dashboard" });
          } catch {
            /* erro tratado no contexto */
          }
        }}
        onError={() => {
          /* noop */
        }}
        useOneTap={false}
      />
    </div>
  );
}
 */