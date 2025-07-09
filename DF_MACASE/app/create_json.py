import pandas as pd

df = pd.read_excel('data/Product_Data_2json.xlsx')

dict = {}

for idx1, col in enumerate(df.columns):
    a = 0

pr_cat = df['PRODUCT_CATEGORY_NAME'].unique()
for ca in pr_cat:
    br_fam = df[df['PRODUCT_CATEGORY_NAME'] == ca]['BRAND_FAMILY_NAME'].unique()
    dict[ca] = {}
    for bf in br_fam:
        br_dif = df[(df['PRODUCT_CATEGORY_NAME'] == ca)&(df['BRAND_FAMILY_NAME']==bf)]['BRAND_DIFFERENTIATOR_MAPPED'].unique()
        dict[ca][bf] = {}
        for bd in br_dif:
            dict[ca][bf][bd] = []
            sb_sku = df[(df['PRODUCT_CATEGORY_NAME'] == ca)&(df['BRAND_FAMILY_NAME']==bf)&(df['BRAND_DIFFERENTIATOR_MAPPED']==bd)]['SUB_SKU'].unique()
            dict[ca][bf][bd] = list(sb_sku)

print(dict)



