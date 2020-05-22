import React from "react";
import ReactDOM from "react-dom";
import faker from "faker";
import List from "./List";

import "./styles.css";

function App() {
  const items = [];
  for (let i = 0; i < 5000; i++) {
    items.push(faker.lorem.sentences());
  }
  return (
    <div className="App">
      <List
        height={300}
        getRowHeight={idx => (idx % 3) * 20 + 30}
        items={items}
        estimatedItemHeight={30}
      >
        {({ item, style, index }) => (
          <div
            key={index}
            className={index % 2 === 0 ? "list-item-even" : "list-item-odd"}
            style={style}
          >
            Row {item}
          </div>
        )}
      </List>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
