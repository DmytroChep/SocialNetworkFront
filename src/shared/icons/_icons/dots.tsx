import Svg, { Path, type SvgProps } from "react-native-svg"

export function DotsIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      stroke="#81818D"
      {...props}
    >
      <Path
        d="M12.188 10a2.187 2.187 0 11-4.375 0 2.187 2.187 0 014.375 0zM10 5.937a2.187 2.187 0 100-4.374 2.187 2.187 0 000 4.375zm0 8.125a2.187 2.187 0 100 4.375 2.187 2.187 0 000-4.375z"
        fill="#81818D"
        stroke="#81818D"
        fillOpacity={1}
      />
    </Svg>
  )
}