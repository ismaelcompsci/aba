import { Atom, useAtomValue } from "jotai";

export function LazyModalRenderer({
  atom,
  children,
}: {
  atom: Atom<{ open: boolean }>;
  children: JSX.Element;
}): JSX.Element | null {
  const modalState = useAtomValue(atom);

  if (!modalState.open) {
    // avoid doing any work until the modal needs to be open
    return null;
  }

  return children;
}
