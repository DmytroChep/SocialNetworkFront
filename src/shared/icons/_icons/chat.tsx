import * as React from "react"
import Svg, { Path, SvgProps} from "react-native-svg"
import { COLORS } from "../../constants"

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
        d="M2.484 10a7.515 7.515 0 0115.03 0v4.782c0 .796 0 1.193-.118 1.511a1.88 1.88 0 01-1.103 1.104c-.319.118-.716.118-1.512.118H10A7.515 7.515 0 012.484 10z"
        stroke={COLORS.plum}
        strokeWidth={1.66667}
        strokeOpacity={1}
      />
      <Path
        d="M7.18 9.06h5.636m-2.818 3.758h2.818"
        stroke={COLORS.plum}
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  )
}