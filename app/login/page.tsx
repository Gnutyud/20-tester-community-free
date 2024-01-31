import SigninWithGoogle from "@/components/sign-in-with-google";
import { Container } from "@/components/ui/container";

const Login = () => {
  return (
    <Container>
      <div className="text-center p-8">
        <h1>Login</h1>
        <SigninWithGoogle />
      </div>
    </Container>
  );
};

export default Login;
