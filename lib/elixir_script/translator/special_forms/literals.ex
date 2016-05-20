defmodule ElixirScript.Translator.SpecialForms.Literals do
  @moduledoc false
  alias ESTree.Tools.Builder, as: JS

  def number(ast, _) do
    JS.literal(ast)
  end

  def boolean(ast, _) do
    JS.literal(ast)
  end

  def nil(ast, _) do
    JS.literal(ast)
  end

  def binary(ast, _) do
    JS.literal(ast)
  end

  def atom(ast, _) do
    JS.call_expression(
      JS.member_expression(
        JS.identifier("Symbol"),
        JS.identifier("for")
      ),
      [binary(Atom.to_string(ast))]
    )
  end
end
