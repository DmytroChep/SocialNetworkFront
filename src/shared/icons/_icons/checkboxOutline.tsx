import Svg, { Path, type SvgProps } from "react-native-svg"

export function CheckboxOutlineIcon(props: SvgProps) {
  return (
    <Svg
      width={15}
      height={15}
      viewBox="0 0 15 15"
      fill="none"
      {...props}
    >
      <Path
        d="M13.125 2.813L5.25 12.187l-3.375-3.75"
        stroke="#543C52"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  )
}