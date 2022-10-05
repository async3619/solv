import { parse as parseDOM } from "node-html-parser";

import { parseSampleTable } from "./parseSampleTable";

describe("parseSampleTable", () => {
    it("should parse sample table successfully", () => {
        const document = parseDOM(`<html>
  <body>
    <table class="table">
      <thead>
        <tr>
          <th>rectangles</th>
          <th>result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>[[0, 1, 4, 4], [3, 1, 5, 3]]</td>
          <td>14</td>
        </tr>
        <tr>
          <td>
            [[1, 1, 6, 5], [2, 0, 4, 2], [2, 4, 5, 7], [4, 3, 8, 6], [7, 5, 9, 7]]
          </td>
          <td>38</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`);

        const table = document.querySelector("table");

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(parseSampleTable(table!)).toMatchSnapshot();
    });

    it("should throws an error when received corrupted table", () => {
        const document = parseDOM(`<html><body><table></table></body></html>`);
        const table = document.querySelector("table");

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(() => parseSampleTable(table!)).toThrow();
    });
});
