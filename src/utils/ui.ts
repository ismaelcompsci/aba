export type DisablePassBorderRadius =
  | boolean
  | "bottom"
  | "top"
  | "start"
  | "end";

export const getBorderRadius = ({
  isFirst,
  isLast,
  radius,
  vertical,
  disable,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  radius: any;
  vertical: boolean;
  isFirst: boolean;
  isLast: boolean;
  disable: DisablePassBorderRadius;
}) => {
  // TODO: RTL support would be nice here
  return {
    borderTopLeftRadius:
      isFirst && disable !== "top" && disable !== "start" ? radius : 0,
    borderTopRightRadius:
      disable !== "top" &&
      disable !== "end" &&
      ((vertical && isFirst) || (!vertical && isLast))
        ? radius
        : 0,
    borderBottomLeftRadius:
      disable !== "bottom" &&
      disable !== "start" &&
      ((vertical && isLast) || (!vertical && isFirst))
        ? radius
        : 0,
    borderBottomRightRadius:
      isLast && disable !== "bottom" && disable !== "end" ? radius : 0,
  };
};
