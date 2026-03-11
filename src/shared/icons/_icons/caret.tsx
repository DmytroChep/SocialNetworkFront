import Svg, { Path, type SvgProps } from "react-native-svg"

export function CaretIcon(props:SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.004 6.667a.992.992 0 010 1.402l-5.29 5.29a.992.992 0 01-1.402 0l-5.29-5.29a.992.992 0 111.402-1.402l4.59 4.59 4.588-4.59a.992.992 0 011.402 0z"
        fill=""
        stroke="#81818D"
        fillOpacity={1}
      />
    </Svg>
  )
}