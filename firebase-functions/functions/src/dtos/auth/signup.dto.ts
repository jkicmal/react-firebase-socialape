import * as yup from "yup";

export const validationSchema = yup.object().shape({
  email: yup.string().required(),
  password: yup
    .string()
    .required()
    .test("passwords-match-test", "passwords dont match", function () {
      return this.parent.password === this.parent.confirmPassword;
    }),
  confirmPassword: yup.string().required(),
  handle: yup.string().required()
});

export interface SignupDto {
  email: string;
  password: string;
  confirmPassword: string;
  handle: string;
}
