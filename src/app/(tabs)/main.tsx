import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";
import { useMeQuery } from "../../shared/api/baseApi";
import { UserContext, useUserContext } from "../../shared/context/user-context";

export default function Main() {
 	const {user, isLoading} = useUserContext()
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if ( user !== null && !user?.userName && !user?.authorName) {
        setModalVisible(true);
    }
}, [isLoading, user]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <FirstEnterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <View style={{ flex: 1 }}>
        <Text>Main</Text>
      </View>
    </SafeAreaView>
  );
}