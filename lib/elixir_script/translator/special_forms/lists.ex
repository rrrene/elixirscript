defmodule ElixirScript.Translator.SpecialForms.Lists do
  @moduledoc false
  alias ESTree.Tools.Builder, as: JS
  alias ElixirScript.Translator

  def list(elements, scope) do
    elements
    |> Enum.map(&Translator.translate!(&1, scope))
    |> JS.array_expression
    |> immutable
  end

  defp immutable(ast) do
    JS.call_expression(
      JS.member_expression(
        JS.identifier("Object"),
        JS.identifier("freeze")
      ),
      [ast]
    )
  end

end
