import * as React from "react"
import Svg, { Path, SvgProps} from "react-native-svg"

export function ChatIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M2.485 10a7.515 7.515 0 0115.03 0v4.782c0 .796 0 1.193-.118 1.511a1.88 1.88 0 01-1.104 1.104c-.318.118-.716.118-1.511.118H10A7.515 7.515 0 012.485 10z"
        stroke="#070A1C"
        strokeWidth={1.66667}
        strokeOpacity={1}
      />
      <Path
        d="M7.182 9.06h5.636M10 12.819h2.818"
        stroke=""
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  )
}