"use client";

import { Code } from "@astryxdesign/core/Code";
import { proportional, Table } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import type { PropRow } from "./featured";

type Row = PropRow & Record<string, unknown>;

export function PropsTable({ rows }: Readonly<{ rows: PropRow[] }>) {
  return (
    <Table
      data={rows as Row[]}
      idKey="name"
      verticalAlign="top"
      columns={[
        {
          key: "name",
          header: "Prop",
          width: proportional(1),
          renderCell: (row: Row) => <Code>{row.name}</Code>,
        },
        {
          key: "type",
          header: "Type",
          width: proportional(2),
          renderCell: (row: Row) => <Code>{row.type}</Code>,
        },
        {
          key: "default",
          header: "Default",
          width: proportional(1),
          renderCell: (row: Row) =>
            row.default ? (
              <Code>{row.default}</Code>
            ) : (
              <Text color="secondary">–</Text>
            ),
        },
        {
          key: "description",
          header: "Description",
          width: proportional(3),
          renderCell: (row: Row) => <Text>{row.description}</Text>,
        },
      ]}
    />
  );
}
