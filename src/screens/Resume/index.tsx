import React, { useEffect, useState } from 'react'
import { VictoryPie } from 'victory-native'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { HistoryCard } from '../../components/HistoryCard'
import { categories } from '../../utils/categories'
import {
  Container,
  Content,
  Header,
  Title,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
} from './styles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useTheme } from 'styled-components/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

interface TransactionData {
  type: 'positive' | 'negative'
  name: string
  amount: string
  category: string
  date: string
}

interface CategoryData {
  key: string
  name: string
  total: number
  totalFormatted: string
  color: string
  percentFormatted: string
  percent: number
}

export function Resume() {
  const theme = useTheme()

  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])

  async function loadData() {
    const dataKey = '@gofinances:transactions'

    const response = await AsyncStorage.getItem(dataKey)
    const responseFormatted = response ? JSON.parse(response) : []

    const expensives = responseFormatted.filter(
      (expensive: TransactionData) => expensive.type === 'negative',
    )

    const expensivesTotal = expensives.reduce(
      (accumulator: number, expensive: TransactionData) => {
        return accumulator + Number(expensive.amount)
      },
      0,
    )

    const totalByCategory: CategoryData[] = []

    categories.forEach(category => {
      let categorySum = 0

      expensives.forEach((expensive: TransactionData) => {
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount)
        }
      })

      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

        const percent = (categorySum / expensivesTotal) * 100
        const percentFormatted = `${percent.toFixed(0)}%`

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
          percentFormatted,
        })
      }
    })

    console.log(totalByCategory)

    setTotalByCategories(totalByCategory)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: useBottomTabBarHeight(),
        }}
      >
        <MonthSelect>
          <MonthSelectButton>
            <MonthSelectIcon name="chevron-left" />
          </MonthSelectButton>

          <Month>Maio</Month>

          <MonthSelectButton>
            <MonthSelectIcon name="chevron-right" />
          </MonthSelectButton>
        </MonthSelect>

        <ChartContainer>
          <VictoryPie
            data={totalByCategories}
            colorScale={totalByCategories.map(category => category.color)}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: 'bold',
                fill: theme.colors.shape,
              },
            }}
            labelRadius={50}
            x="percentFormatted"
            y="total"
          />
        </ChartContainer>

        {totalByCategories.map(item => (
          <HistoryCard
            key={item.key}
            title={item.name}
            amount={item.totalFormatted}
            color={item.color}
          />
        ))}
      </Content>
    </Container>
  )
}