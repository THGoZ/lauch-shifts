import { Image } from 'expo-image'
import React from 'react'
import { Text, View } from 'react-native'

type ErrorDisplayProps = {
  message: string,
  className?: string
  type?: "small" | "large"
}

const ErrorDisplay = (error: ErrorDisplayProps) => {
  return (
    <View className={`flex-row items-center ${error.className} bg-red-600/20 rounded-xl p-2 mt-2 border border-red-600/80`}>
      <Image 
      source={require("@/assets/animatedIcons/letter-x.gif")}
      style={{
        width: 20,
        height: 20,
      }}
      ></Image>
      <Text className="text-red-500 mx-2">{error.message}</Text>
    </View>
  )
}

export default ErrorDisplay