#Goal
Non-verbatim clone of qlkit ClojureScript library.

#Read only flow
1. create root query
2. parse query to produce props tree
3. refresh UI

Components use create-instance to create a children with provided data




QueryResult
{
  query,
  result: {
    prop1,
    prop2,
    prop3: [
      QueryResult,
      QueryResult,
    ]
  }
}

Query
[[:qlkit/todos {} [[:todo/text {}] [:todo/id {}]]]]

QueryResult
{
  query: [['qlkit/todos' {} [['todo/text' {}] ['todo/id' {}]]]],
  result: {
    todos: [
      {query: [['todo/text' {}] ['todo/id' {}]],
      result: {
      text: 'Buy apples',
      id: 123}},
      {query: [['todo/text' {}] ['todo/id' {}]],
      result: {
        text: 'Buy milk',
        id: 456
      }},
    ]
  }
}

parseQuery
convertQueryToDataTree
renderInstance


Что бы отрендерить компонент мне нужны "плоские" проперти и id дочерних компонентов.
Для рендеринг компонента вызывается специальная функция получающая на вход квери с данными окружения.
В данных окружения нужно передать id для того что бы дочерняя квери вытянула именно те данные,
что нужны определенном дочернему компоненту.

1. expand root query
2. parse state
3. render UI
