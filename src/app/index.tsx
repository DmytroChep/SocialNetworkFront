import { Redirect } from "expo-router";
import { useUserContext } from "../shared/context/user-context";

export default function Index() {
    const { token, isLoading } = useUserContext();
    if (isLoading) {
        return null;
    }
    console.log(token)

    return (
        <Redirect href={!token ? "/registration" : "/(tabs)/main"} />
    );
}