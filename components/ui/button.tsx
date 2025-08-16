import { ButtonHTMLAttributes } from "react";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return <button className={"btn " + className} {...rest} />;
}
export function ButtonSecondary(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return <button className={"btn-secondary " + className} {...rest} />;
}
