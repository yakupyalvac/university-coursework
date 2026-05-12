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

plot_sex_bar <- ggplot(df, aes(x = sex, fill = sex)) +
  geom_bar() +
  labs(title = "Cinsiyet Dağılımı",
       x = "Cinsiyet",
       y = "Kişi Sayısı") +
  theme_light() +
  theme(legend.position = "none")

plot_sex_bar

Sys.setlocale("LC_ALL", "tr_TR.UTF-8")

plot_smoker_bar <- ggplot(df, aes(x = smoker, fill = smoker)) +
  geom_bar() +
  scale_fill_manual(values = c(
    "no" = "#2ca02c",
    "yes" = "#d62720")) +
  labs(title = "Sigara İçme Durumu", x = "Sigara iciyor mu?",
       y = "Kişi Sayısı") +
  theme_light() +
  theme(legend.position = "none")

plot_smoker_bar

plot_region_bar <- ggplot(df, aes(x = region, fill = region)) +
  geom_bar() +
  scale_fill_manual(values = c (
    "southwest" = "blue",
    "southeast" = "purple",
    "northwest" = "orange",
    "northeast" = "pink"
  )) +
  labs(title = "Bölgelere Göre Dağılım",
       x = "Bölge",
       y = "Kişi Sayısı") +
  theme_light() +
  theme(legend.position = "none")

plot_region_bar

library(patchwork)

plot_sex_bar + plot_smoker_bar /plot_region_bar


ggplot(df, aes(x = smooker, y = charges, fill = smoker)) +
  geom_boxplot(alpha = 0.8) +
  labs(
    title = "Insurance Costs Based on smoking status",
    x = "Does he/she smoke?",
    y = "Costs($)"
  ) +
  theme_light() +
  theme(legend.position = "none") +
  stat_summary(fun = mean.geom = "point", shape = 23,
               size = 4, fill = "white")

