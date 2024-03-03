import pandas as pd

df = pd.read_csv('cleaned_5250.csv')

df = df.loc[df['radius_wrt']=="Earth"]

df = df.loc[df['mass_wrt']=="Earth"]

df['First_Word'] = df['name'].str.split().str.get(1)

df = df.drop_duplicates(subset='First_Word', keep='first')

df = df.drop(columns=['First_Word'])

df['First_Word'] = df['name'].str.split().str.get(0) + df['planet_type']

df = df.drop_duplicates(subset='First_Word', keep='first')

df = df.drop(columns=['First_Word'])

df = df.dropna(how='any')

df.to_csv('dv_data.csv', index=False)