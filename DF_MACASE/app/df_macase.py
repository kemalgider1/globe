import streamlit as st
import pandas as pd
import altair as alt
# Duty Free MArkets Coverage Analysis & Scope Estimation
st.title("DF-MACASE tool")
st.subheader(":red[D]uty :red[F]ree :red[Ma]rkets :red[C]overage :red[A]nalysis & :red[S]cope :red[E]stimation")

if 'markets' not in st.session_state:
    st.session_state.markets = ['All']
if 'airports' not in st.session_state:
    st.session_state.airports = ['All']
if 'nationalty' not in st.session_state:
    st.session_state.nationalty = ['All']

@st.cache_data
def load_data(path='app/data/DF_PAX_PnL_2023.xlsx'):
    df = pd.read_excel(path)
    return df

@st.cache_data
def get_data(df):
    _mrkts = df['COUNTRY_NAME'].unique()
    _s_mrkts = sorted(_mrkts)

    _airp_ = df[['COUNTRY_NAME',
                'AIRPORT_NAME',
                'DF_LOCATION']].groupby(['COUNTRY_NAME',
                                         'AIRPORT_NAME',
                                         'DF_LOCATION']).agg('count').reset_index()
    _nats_ = df[['COUNTRY_NAME',
                'AIRPORT_NAME',
                'DF_LOCATION',
                'NATIONALITY']].groupby(['COUNTRY_NAME',
                                         'AIRPORT_NAME',
                                         'DF_LOCATION',
                                         'NATIONALITY']).agg('count').reset_index()
    pax = df['PAX'].sum()
    spend = (df['PAX']*df['$/PAX tob. spend - PMI']).sum()
    nor = (df['PAX']*df['$/PAX tob. spend - PMI']*df['PMI profitbl, %']).sum()
    return _s_mrkts, _airp_, _nats_, pax, spend, nor

df = load_data(path='app/data/DF_PAX_PnL_2023.xlsx')

lst_mrkts, _airp, _nats, tot_pax, tot_spend, tot_nor = get_data(load_data())


def make_donut(input_response, input_text, input_color):
    if input_color == 'blue':
        chart_color = ['#29b5e8', '#155F7A']
    if input_color == 'green':
        chart_color = ['#27AE60', '#12783D']
    if input_color == 'orange':
        chart_color = ['#F39C12', '#875A12']
    if input_color == 'red':
        chart_color = ['#E74C3C', '#781F16']

    source = pd.DataFrame({
        "Topic": ['', input_text],
        "% value": [100 - input_response, input_response]
    })
    source_bg = pd.DataFrame({
        "Topic": ['', input_text],
        "% value": [100, 0]
    })

    plot = alt.Chart(source).mark_arc(innerRadius=60, cornerRadius=25).encode(
        theta="% value",
        color=alt.Color("Topic:N",
                        scale=alt.Scale(
                            # domain=['A', 'B'],
                            domain=[input_text, ''],
                            # range=['#29b5e8', '#155F7A']),  # 31333F
                            range=chart_color),
                        legend=None),
    ).properties(width=200, height=200)

    text = plot.mark_text(align='center', color="#29b5e8", font="Lato", fontSize=32, fontWeight=700,
                          fontStyle="italic").encode(text=alt.value(f'{input_response} %'))
    plot_bg = alt.Chart(source_bg).mark_arc(innerRadius=60, cornerRadius=20).encode(
        theta="% value",
        color=alt.Color("Topic:N",
                        scale=alt.Scale(
                            # domain=['A', 'B'],
                            domain=[input_text, ''],
                            range=chart_color),  # 31333F
                        legend=None),
    ).properties(width=200, height=200)
    return plot_bg + plot + text

def filter_airports():
    if st.session_state.markets == ['All']:
        s_markets = sorted(_nats['COUNTRY_NAME'].unique())
    else:
        s_markets = st.session_state.markets

    _airp_sel = _airp[(_airp['COUNTRY_NAME'].isin(s_markets)) &(_airp['DF_LOCATION'] == _airp['DF_LOCATION'])]
    _airp_lst = sorted(_airp_sel['AIRPORT_NAME'].unique())
    return ['All'] + _airp_lst

def filter_nationalities():
    if st.session_state.markets == ['All']:
        s_markets = sorted(_nats['COUNTRY_NAME'].unique())
    else:
        s_markets = st.session_state.markets

    if st.session_state.airports == ['All']:
        s_airports = sorted(_nats['AIRPORT_NAME'].unique())
    else:
        s_airports = st.session_state.airports

    _nat_sel = _nats[(_nats['COUNTRY_NAME'].isin(s_markets)) & (_nats['DF_LOCATION'] == _nats['DF_LOCATION']) & (_nats['AIRPORT_NAME'].isin(s_airports))]
    _nats_lst = sorted(_nat_sel['NATIONALITY'].unique())
    return ['All'] + _nats_lst

def data_compute():
    if st.session_state.markets == ['All']:
        s_markets = sorted(df['COUNTRY_NAME'].unique())
    else:
        s_markets = st.session_state.markets

    if st.session_state.airports == ['All']:
        s_airports = sorted(df['AIRPORT_NAME'].unique())
    else:
        s_airports = st.session_state.airports

    if st.session_state.nationalty == ['All']:
        s_nationalty = sorted(df['NATIONALITY'].unique())
    else:
        s_nationalty = st.session_state.nationalty

    selection = df[(df['COUNTRY_NAME'].isin(s_markets)) & (df['AIRPORT_NAME'].isin(s_airports)) & (df['NATIONALITY'].isin(s_nationalty))]
    sub_selection = df[(df['COUNTRY_NAME'].isin(s_markets)) & (df['AIRPORT_NAME'].isin(s_airports))]
    return selection, sub_selection

if st.multiselect('Please specify DF markets', options=['All'] + lst_mrkts, key='markets'):
    st.multiselect('Please specify explicitly Airports (optional)', options=filter_airports(), key='airports')
    st.multiselect('Please specify explicitly Nationalities (optional)', options=filter_nationalities(), key='nationalty')

groupped, sub_select = data_compute()

_grp = groupped[['NATIONALITY', 'PAX']].groupby('NATIONALITY').sum().reset_index().sort_values('PAX', ascending=False).head(9)
grp_oth = groupped[['PAX']][~groupped['NATIONALITY'].isin(list(set(_grp['NATIONALITY'].unique())))].sum().values[0]
grp = pd.concat([_grp, pd.DataFrame({'NATIONALITY':'Others', 'PAX': grp_oth }, index=[999999])]).reset_index()
pd.options.display.float_format = '{:,.0f}'.format
grp['PAX'] = (grp['PAX']*1000).astype(int)

st.divider()

col1, col2 = st.columns([3, 5])

col1.write("### Top 9 Nationalities")
col1.dataframe(grp[['NATIONALITY', 'PAX']], hide_index=True)
col2.metric('PAX of selected Nationalities (of all Nationalities)', '{:,.0f} ({:.1f}%)'.format(groupped['PAX'].sum()*1000,
                                                                                              groupped['PAX'].sum()/sub_select['PAX'].sum()*100))
col2.metric('PAX in the selected Airport(s) (of total DF PAX)', '{:,.0f} ({:.1f}%)'.format(sub_select['PAX'].sum()*1000,
                                                                                          sub_select['PAX'].sum()/tot_pax*100))
col2.metric('LANU of selected Nationalities (of all LANU in the selection)', '{:,.0f} ({:.1f}%)'.format((groupped['PAX']*0.9*groupped['% Prevalence']).sum()*1000,
                                                                                                       (groupped['PAX']*0.9*groupped['% Prevalence']).sum()/(sub_select['PAX']*0.9*sub_select['% Prevalence']).sum()*100))
col2.metric('PMIDF $ spend per LANU (VS average in the selection)', '${:,.2f} (${:.2f})'.format((groupped['PAX']*groupped['$/PAX tob. spend - PMI']).sum()/(groupped['PAX']*0.9*groupped['% Prevalence']).sum(),
                                                                                                (sub_select['PAX']*sub_select['$/PAX tob. spend - PMI']).sum()/(sub_select['PAX']* 0.9 *sub_select['% Prevalence']).sum()))

col2.metric('Total PAX travelled in DF 2023', '{:,.0f}'.format(tot_pax*1000))

st.divider()

col3, col4 = st.columns([5, 4])
col3.write("### Financials overview")
col3.metric('PAX spent on PMI in sel. Nationalities (of all Nationalities)','${:,.0f} ({:.1f}%)'.format((groupped['PAX']*groupped['$/PAX tob. spend - PMI']).sum()*1000,(groupped['PAX']*groupped['$/PAX tob. spend - PMI']).sum()/(sub_select['PAX']*sub_select['$/PAX tob. spend - PMI']).sum()*100))
col3.metric('PAX spent on PMI in sel. Airport(s) (of Total PMIDF PAX spend)','${:,.0f} ({:.1f}%)'.format((sub_select['PAX']*sub_select['$/PAX tob. spend - PMI']).sum()*1000,(sub_select['PAX']*sub_select['$/PAX tob. spend - PMI']).sum()/tot_spend*100))
col3.metric('Total PAX spent on PMI products 2023', '${:,.0f}'.format(round(tot_spend*1000,2)))
col3.metric('Selected Airports PMI DF NOR 2023', '${:,.0f}'.format(round((sub_select['PAX']*sub_select['$/PAX tob. spend - PMI']*sub_select['PMI profitbl, %']).sum()*1000,2)))
col3.metric('Total Airports PMI DF NOR 2023', '${:,.0f}'.format(round(tot_nor*1000,2)))

LAS_prc = (groupped['PAX']*groupped['Nat. % of CT']).sum()/groupped['PAX'].sum()
PMI_CC_prc = (groupped['PAX']*groupped['$/PAX tob. spend - PMI']*groupped['% of COT, CC ']).sum()/(groupped['PAX']*groupped['$/PAX tob. spend - PMI']).sum()

donut_PAX = make_donut(round(LAS_prc*100,1), '% LAS out of LANU travellers', 'green')
donut_sales = make_donut(round(PMI_CC_prc*100,1), '% of PMI CC sales, in $$', 'blue')
col4.write("##### % PAX CC users (vs all LANU)")
col4.altair_chart(donut_PAX)
col4.write("##### % PMIDF CC purchases (vs all Cat.)")
col4.altair_chart(donut_sales)

st.divider()
with st.expander("Browse the raw data.."):
    st.dataframe(load_data())
st.divider()
st.write("Designed by [AK](mailto:alexey.kayuchenko@pmi.com)")