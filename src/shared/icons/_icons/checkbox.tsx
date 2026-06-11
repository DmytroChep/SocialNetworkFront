import Svg, { Path, type SvgProps } from "react-native-svg"
import { COLORS } from "../../constants"

export function CheckboxIcon(props: SvgProps) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 17 17"
      fill="none"
      {...props}
    >
      <Path
        d="M12.25 5.375L7 11.625l-2.25-2.5"
        stroke={COLORS.plum}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
      <Path
        d="M14.125 1H2.875C1.839 1 1 1.84 1 2.875v11.25C1 15.161 1.84 16 2.875 16h11.25C15.161 16 16 15.16 16 14.125V2.875C16 1.839 15.16 1 14.125 1z"
        stroke={COLORS.plum}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  )
}
