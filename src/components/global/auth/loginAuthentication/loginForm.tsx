import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "../../input/form";
import useLoginAuthentication from "./useLoginAuthentication";

function LoginForm() {
  const { register, onAuthenticate, handleSubmit } = useLoginAuthentication();

  return (
    <DialogContent className="max-w-[425px]">
      <form
        onSubmit={handleSubmit(onAuthenticate)}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle className="text-center">Login User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Form.InputText
            name="username"
            title="Username"
            register={register}
          />
          <Form.InputPassword
            name="password"
            title="Password"
            register={register}
          />
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <Button aria-label="Login" variant="default" type="submit">
            Login
          </Button>
          <DialogClose asChild>
            <Button aria-label="Cancel" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default LoginForm;
