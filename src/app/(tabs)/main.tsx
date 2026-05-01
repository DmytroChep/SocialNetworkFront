import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";
import { useGetAllPostsQuery, useMeQuery } from "../../shared/api/baseApi";
import { UserContext, useUserContext } from "../../shared/context/user-context";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import { useRouter } from "expo-router";

export default function Main() {
 	const {user, isLoading} = useUserContext()
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter()

  const {data: posts} = useGetAllPostsQuery(undefined, {pollingInterval: 1000})

  const finalPosts = posts || []

  // if (!user){
  //   router.replace("/registration")
  //   return
  // }

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
      <ScrollView style={{ flex: 1 }}>
        {finalPosts.map((post) => {
          return (<PublicationCard post={post} key={post.id} userId={user?.id}/>)
        })}
      </ScrollView>
    </SafeAreaView>
  );
}