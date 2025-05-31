"use client";

import type { FC, PropsWithChildren } from "react";
import { useThreadListIsLoading } from "../../../context";

type UseThreadListIfProps = {
  isLoading: boolean;
};

const useThreadListIf = (props: UseThreadListIfProps): boolean => {
  const listIsLoading = useThreadListIsLoading();

  if (props.isLoading === true && !listIsLoading) return false;
  if (props.isLoading === false && listIsLoading) return false;

  return true;
};

export namespace ThreadListPrimitiveIf {
  export type Props = PropsWithChildren<UseThreadListIfProps>;
}

export const ThreadListPrimitiveIf: FC<ThreadListPrimitiveIf.Props> = ({
  children,
  ...props
}) => {
  const shouldRender = useThreadListIf(props);
  return shouldRender ? children : null;
};

ThreadListPrimitiveIf.displayName = "ThreadListPrimitive.If";
