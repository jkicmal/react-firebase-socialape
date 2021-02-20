export const extractYupErrors = (errors: any[]) => {
  const o: any = new Object();
  errors.forEach((err: any) => (o[err.path] = err.message));
  return o;
};
