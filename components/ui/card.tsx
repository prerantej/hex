import { HTMLAttributes } from "react";
export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={"card " + className} {...rest} />;
}
