import { Animated } from "react-native";
import { Coordinate } from "../types";
import { colors } from "../styles/theme";
import {
    BORDER,
    BORDER_RADIUS,
    GAP,
    HEADER_HEIGHT,
    PIXEL,
    SPEED,
} from "../consts";

const Snake = ({ snake, top }) => {
    return (
        <>
            {snake.map((node, index) => {
                const nodeStyle = {
                    width: PIXEL,
                    height: PIXEL,
                    borderWidth: GAP,
                    borderColor: colors.p6,
                    borderRadius: BORDER_RADIUS,
                    top: node.y * PIXEL + top + HEADER_HEIGHT,
                    left: node.x * PIXEL + BORDER,
                    backgroundColor: index === 0 ? colors.p7 : colors.p2,
                    zIndex: index === 0 ? 99 : 1,
                };
                return (
                    <Animated.View
                        style={[{ position: "absolute" }, nodeStyle]}
                        key={index}
                    />
                );
            })}
        </>
    )
}

export default Snake

