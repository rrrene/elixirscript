defmodule ElixirScript.Translator.SpecialForms.Tuples do
  @moduledoc false
  alias ESTree.Tools.Builder, as: JS
  alias ElixirScript.Translator

  def tuple({one, two}, scope) do
    tuple([one, two], scope)
  end

  def tuple(elements, scope) do
    tuple_class = JS.member_expression(
      JS.member_expression(
        JS.identifier("Elixir"),
        JS.identifier("Core")
      ),
      JS.identifier("Tuple")
    )

    elements = Enum.map(elements, &Translator.translate!(&1, scope))

    JS.new_expression(tuple_class, elements)
  end

end
