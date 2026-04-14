import React from 'react';
import { StyleSheet, View, ScrollView, Text, Image } from "react-native";
import { Header } from "../../shared/ui/Header";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { Input } from "../../shared/ui/input";
import { RoundButton } from "../../shared/ui/RoundButton";
import { ICONS } from "../../shared/icons";
import { IMAGES } from "../../shared/images";
import { styles } from "./settings.styles";

export default function ProfileScreen() {
  
  const PersonalInfoContent = (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Картка профілю</Text>
          <RoundButton icon={<ICONS.edit />} /> 
        </View>
        <View style={styles.avatarSection}>
		{/* <Image source={IMAGES.userAvatar || { uri: 'https://via.placeholder.com/100' }} style={styles.avatar} /> */}
          <Text style={styles.name}>Lina Li</Text>
          <Text style={styles.handle}>@thelili</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Особиста інформація</Text>
          <RoundButton icon={<ICONS.edit/>} />
        </View>
        <Input label="Ім'я" value="Li" />
        <Input label="Прізвище" value="Li" />
        <Input label="Дата народження" value="15.04.2001" iconRight={<ICONS.eyeClosed />}/>
        <Input label="Електронна адреса" value="you@example.com" iconRight={<ICONS.eyeClosed />} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Пароль</Text>
          <RoundButton icon={<ICONS.edit />} />
        </View>
        <Input.Password value="password123" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Варіанти підпису</Text>
          <RoundButton icon={<ICONS.edit />} />
        </View>
        
        <View style={styles.checkboxRow}>
          <ICONS.checkbox/>
          <Text style={styles.checkboxLabel}>Псевдонім автора</Text>
        </View>
        <Text style={styles.signatureText}>Lina Li</Text>

        <View style={styles.checkboxRow}>
          <ICONS.checkbox />
          <Text style={styles.checkboxLabel}>Мій електронний підпис</Text>
        </View>
        {/* <Image source={IMAGES.signature} style={styles.signatureImg} resizeMode="contain" /> */}
      </View>
    </ScrollView>
  );

  const tabsArray = [
    { title: "Особиста Інформація", content: PersonalInfoContent },
    { title: "Альбоми", content: <View style={styles.placeholder}><Text>Тут будуть альбоми</Text></View> }
  ];

  return (
    <View style={styles.container}>
      <Header hiddenButtons={{ plus: true, settings: true, exit: true }} />
      <RadioTabs radioTabsArray={tabsArray} />
    </View>
  );
}