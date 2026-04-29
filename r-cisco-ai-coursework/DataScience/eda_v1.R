#EXPLORARY DATA ANALYSIS (EDA) IN R

getwd()
setwd("C:/Users/PC00/Desktop/GULAY_EKREN/EDA1")

#https://www.kaggle.com/datasets/zhaojingloveniuniu/insurance-csv/data

# Let’s load the necessary libraries
library(tidyverse) 

# This includes essential tools such as ggplot2, dplyr and readr

#Now, let’s load the insurance.csv file—the heart of our project—into the R environment.
#To do this, we’ll use read_csv() function from the readr package (which is part of the tidyverse).

# Let’s read the insurance.csv file and assign it to a data frame named “insurance_df”

df <- read_csv("insurance.csv")

# Let’s take a look at the first 6 rows of our dataset 
head(df)

# Let’s take a closer look at the structure of our dataset
glimpse(df)

# Let’s view the statistical summary for each column
summary(df)

####df$sex[df$sex=="male"]

erkek <- df[df$sex == "male", ]

kadin <- df[df$sex == "female", ]

View(erkek)

table(df$sex)

#some comments about outcome

#Age: The youngest person is 18 and the oldest is 64. 
#The average age is approximately 39.
#BMI (Body Mass Index): The average BMI is around 30.6, 
#which may indicate that the general population is close to the ‘overweight’ category.
#Charges: Costs range from 1,122 USD to 63,770 USD. 
#There is a significant difference between the Mean (13,270 USD) and the Median (9,382 USD). 
#This gives us the first indication that the distribution of charges may be skewed to the right 
#(i.e., a small group of people with very high costs may be pulling the average upwards)!

#The most important issue for us is missing data. 
#Before we begin the analysis, 
#let’s check whether there are any missing values in our dataset.

# Let’s display the total number of missing values (NA) in each column

colSums(is.na(df))

#Perfect! The result is 0 for every column.
#This shows that our dataset is error-free.


#One-way (Single-Variable) Analysis

#First, let’s visualise the distributions of our numerical variables; age, bmi, children
#and our target variable; charges.

#One of the best ways to understand the distribution of a variable is to plot a histogram.

install.packages("tidyverse")
library(tidyverse)

# Age Distribution
plot_yas_dagilim <- ggplot(df, aes(x = age)) +
  geom_histogram(binwidth = 5, 
                 fill = "pink", 
                 color = "white", 
                 alpha = 0.8) +
  labs(title = "Yaş Dağılımı", 
       x = "Yaş", 
       y = "Kişi Sayısı") +
  theme_light()

#bindwidth=5 ; Each bar represents a 5-unit interval.
plot_yas_dagilim

View(df)

#bmi Distribution
plot_bmi_hist <- ggplot(df, aes(x = bmi)) +
  geom_histogram(binwidth = 2, 
                 fill = "#ff7f0e", 
                 color = "white", 
                 alpha = 0.8) +
  labs(title = "Vücut Kitle İndex (VKİ) Dağılımı", 
       x = "VKİ", 
       y = "Kişi Sayısı") +
  theme_grey()

plot_bmi_hist

# Number of children distribution
plot_cocuk_hist <- ggplot(df, aes(x = children)) +
  geom_histogram(binwidth = 1, 
                 fill = "#2ca02c", 
                 color = "white", 
                 alpha = 0.8) +
  labs(title = "Çocuk Sayısı Dağılım Grafiği", 
       x = "Çocuk Sayısı", y = "Kişi Sayısı") +
  theme_light()

plot_cocuk_hist

# Charges Distribution
plot_maliyet_hist <- ggplot(df, aes(x = charges)) +
  geom_histogram(binwidth = 1000, 
                 fill = "#d62728", 
                 color = "white", 
                 alpha = 0.8) +
  labs(title = "Maliyet Dağılımı", 
       x = "Maliyetler($)", y = "Kişi Sayısı") +
  theme_light()

plot_maliyet_hist

# Call for patchwork library
install.packages("patchwork")

library(patchwork)

# Let’s display these four graphs on a single canvas
(plot_yas_dagilim + plot_bmi_hist) / 
  (plot_cocuk_hist + plot_maliyet_hist)