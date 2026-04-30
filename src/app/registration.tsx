import { Link, Redirect } from "expo-router";
import { View } from "react-native";
import { COLORS } from "../shared/constants";
import { LoginForm } from "../shared/ui/LoginForm";
import { RegistrationForm } from "../shared/ui/RegistrationForm/form";
import { CodeConfirmationModal } from "../shared/ui/codeConfirmationModal";
import { PublicationCard } from "../modules/my-publications/ui/publicationCard/publicationCard";

export default function Registration() {
    return (
        <View style={{flex: 1, backgroundColor: COLORS.plum50, paddingTop: 39, alignItems: "center", paddingHorizontal: 16,  justifyContent: "center"}}>
            <RegistrationForm />
            {/* {MOCK_DATA.map((item)=> (
                <PublicationCard key={item.id} post={item} /> 
            ))} */}
            {/* <CodeConfirmationModal title="Підтвердження пошти" /> */}
        </View>
    )
}
