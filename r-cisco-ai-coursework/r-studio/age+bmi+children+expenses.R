getwd()
library(tidyverse)
df <- read.csv("insurance.csv")

head(df)
glimpse(df)

summary(df)

df$region

df$sex

df [df$sex == "male",]

table(df$sex)

erkek <- df[df$sex == "male",]

kadin <- df[df$sex == "female",]

View(erkek)

View(kadin)

colSums(is.na(df))

plot_age_hist <- ggplot(df,aes(x=age)) +
  geom_histogram(binwidth = 5,
  fill = "#1f77b4" ,
  color = "white",
  alpha = 0.8) +

labs(title = "Yaş Dağılımı",
     x = "Yaş",
     y = "Kişi Sayısı") +
  theme_light()
plot_age_hist

#bindwidth=5 ; Each bar represents a 5-unit interval.


plot_bmi_hist <- ggplot(df,aes(x=bmi)) +
  geom_histogram(binwidth = 2,
                 fill = "#00001f" ,
                 color = "white",
                 alpha = 0.8) +
  
  labs(title = "Vücut Kitle İndex (VKİ) Dağılımı",
       x = "VKİ",
       y = "Kişi Sayısı") +
  theme_light()
plot_bmi_hist


plot_children_hist <- ggplot(df,aes(x=children)) +
  geom_histogram(binwidth = 2,
                 fill = "#00005f" ,
                 color = "white",
                 alpha = 0.8) +
  
  labs(title = "Çocuk Sayısı Dağılım Grafiği",
       x = "Çocuk Sayısı",
       y = "Kişi Sayısı") +
  theme_light()
plot_children_hist


plot_expenses_hist <- ggplot(df,aes(x=expenses)) +
  geom_histogram(binwidth = 2500,
                 fill = "#00005f" ,
                 color = "white",
                 alpha = 0.8) +
    labs(title = "Maliyet Dağılımı",
       x = "Maliyetler($)",
       y = "Kişi Sayısı") +
  theme_light()



plot_expenses_hist
install.packages("patchwork")
library(patchwork)

(plot_age_hist + plot_bmi_hist) /
(plot_children_hist + plot_expenses_hist)
