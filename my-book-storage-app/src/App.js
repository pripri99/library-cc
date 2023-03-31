import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <BookForm />
        </Route>
        <Route path="/books">
          <BookList />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
