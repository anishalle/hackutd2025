/// <reference types="vite/client" />

declare module '@emotion/styled' {
  import styled from '@emotion/styled'
  export default styled
}

declare module 'recharts' {
  import type { ComponentType } from 'react'

  export const LineChart: ComponentType<unknown>
  export const Line: ComponentType<unknown>
  export const XAxis: ComponentType<unknown>
  export const YAxis: ComponentType<unknown>
  export const CartesianGrid: ComponentType<unknown>
  export const Tooltip: ComponentType<unknown>
  export const BarChart: ComponentType<unknown>
  export const Bar: ComponentType<unknown>
}
