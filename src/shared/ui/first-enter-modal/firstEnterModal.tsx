import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./firstEnterModal.styles";
import { Button } from "../button";
import { Input } from "../input";
import { ICONS } from "../../icons";

export function FirstEnterModal() {
  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        
        <TouchableOpacity style={styles.closeButton}>
          <ICONS.cross/>
        </TouchableOpacity>

        <Text style={styles.title}>Додай деталі про себе</Text>

        <View style={styles.form}>

          <Input 
          label="qgmqpgmqpgmqwpgmp"
          labelStyle={styles.label}
              placeholder="Введіть Псевдонім автора" 
               
          />

            <Input 
            label="Ім'я користувача"
            labelStyle={styles.label}
            placeholder="govno"
            />
           
          <View style={styles.inputGroup}>
            <Text style={styles.helperText}>
              Або оберіть: <Text style={styles.greenText}>(Запропоновані варіанти відповідно до Ім’я та Прізвища)</Text>
            </Text>
            
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Продовжити" titleStyle={styles.buttonText}></Button>
        </View>

      </View>
    </View>
  );
}