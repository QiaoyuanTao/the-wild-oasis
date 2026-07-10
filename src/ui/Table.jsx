import { createContext, useContext } from "react";
import styled from "styled-components";

// ============================================================
// Table 复合组件（Compound Component）
// ============================================================
// 使用方式：
//   <Table columns="1fr 2fr 1fr">
//     <Table.Header>...</Table.Header>
//     <Table.Body data={data} render={(item) => <Table.Row>...</Table.Row>} />
//     <Table.Footer>...</Table.Footer>
//   </Table>
//
// 核心思想：
//   Table、Header、Row、Body、Footer 都是独立的子组件，
//   但通过挂载到 Table 对象上（Table.Header = Header），
//   形成语义化的“一家人”，调用方可以像写 HTML 表格一样拼装它们。
// ============================================================

const StyledTable = styled.div`
  border: 1px solid var(--color-grey-200);

  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

// Header 和 Row 共享的网格布局
// columns 会作为 prop 传入，决定每一列的宽度比例
const CommonRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columns};
  column-gap: 2.4rem;
  align-items: center;
  transition: none;
`;

const StyledHeader = styled(CommonRow)`
  padding: 1.6rem 2.4rem;

  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
`;

const StyledRow = styled(CommonRow)`
  padding: 1.2rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const StyledBody = styled.section`
  margin: 0.4rem 0;
`;

const Footer = styled.footer`
  background-color: var(--color-grey-50);
  display: flex;
  justify-content: center;
  padding: 1.2rem;

  /* This will hide the footer when it contains no child elements. Possible thanks to the parent selector :has 🎉 */
  &:not(:has(*)) {
    display: none;
  }
`;

const Empty = styled.p`
  font-size: 1.6rem;
  font-weight: 500;
  text-align: center;
  margin: 2.4rem;
`;

// 创建 Context，用于在 Table 和它的子组件之间共享 columns 配置。
// 这样 Header 和 Row 不需要从 props 一层层接收 columns，
// 只要被放在 <Table> 内部，就能通过 useContext 拿到。
const TableContext = createContext();

// Table 是复合组件的“根”。
// columns: 网格列宽，例如 "0.6fr 1.8fr 2.2fr 1fr 1fr 1fr"，
//          会写入 Context 供 Header、Row 使用。
function Table({ columns, children }) {
  return (
    <TableContext.Provider value={{ columns }}>
      <StyledTable role="table">{children}</StyledTable>
    </TableContext.Provider>
  );
}

// 表头组件。从 Context 读取 columns，自动对齐列宽。
// 调用方只需填入对应的列标题元素。
function Header({ children }) {
  const { columns } = useContext(TableContext);
  return (
    <StyledHeader role="row" columns={columns} as="header">
      {children}
    </StyledHeader>
  );
}

// 表格行组件。从 Context 读取 columns，自动对齐列宽。
// 每一行由调用方决定渲染什么内容（例如 CabinRow）。
function Row({ children }) {
  const { columns } = useContext(TableContext);
  return (
    <StyledRow role="row" columns={columns}>
      {children}
    </StyledRow>
  );
}

// 表格主体。
// data:  要渲染的数据数组。
// render: 渲染函数，接收 data 中的每一项，返回一个 React 元素（通常是 <Table.Row>）。
//         这是 render prop 模式，把“怎么渲染一行”的决定权交给调用方。
function Body({ data, render }) {
  if (!data.length) return <Empty>No data to show at the moment</Empty>;
  return <StyledBody>{data.map(render)}</StyledBody>;
}

// 把子组件挂载到 Table 对象上，形成复合组件 API。
// 这样外部可以统一通过 Table.Header、Table.Body、Table.Row、Table.Footer 访问。
Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Footer = Footer;

export default Table;
