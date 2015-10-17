defmodule ElixirScript.Translator.Utils do
  @moduledoc false
  alias ESTree.Tools.Builder, as: JS
  alias ElixirScript.Translator
  alias ElixirScript.Translator.Primitive

  def inflate_groups(body) do
    Enum.map(body, fn(x) -> 
      case x do
        %ElixirScript.Translator.Group{body: group_body} ->
          group_body
        %ESTree.BlockStatement{} ->
          %ESTree.BlockStatement{ body: inflate_groups(x.body) }
        %ESTree.IfStatement{} ->
          %{x | consequent: inflate_groups(x.consequent), alternate: inflate_groups(x.alternate) }
        _ ->
          x
      end
    end)
    |> List.flatten
  end

  def make_module_expression_tree([module], computed, env) do
    make_module_expression_tree(module, computed, env)
  end

  def make_module_expression_tree(modules, computed, _) when is_list(modules) do
    Enum.reduce(modules, nil, fn(x, ast) ->
      case ast do
        nil ->
          JS.member_expression(JS.identifier(x), nil, computed)
        %ESTree.MemberExpression{ property: nil } ->
          %{ ast | property: JS.identifier(x) }
        _ ->
          JS.member_expression(ast, JS.identifier(x), computed)
      end
    end)
  end

  def make_module_expression_tree(module, _computed, _) when is_binary(module) or is_atom(module) do
    JS.identifier(module)
  end

  def make_module_expression_tree(module, _computed, env) do
    Translator.translate(module, env)
  end

  defp make_gen_call(func, params) do
    JS.yield_expression(
      JS.call_expression(
        JS.member_expression(
          JS.identifier("JS"),
          JS.identifier("run")
        ),
        [func, Primitive.make_list_no_translate(params)]
      ),
      true
    )
  end

  def make_call_expression_with_ast_params(module_name, function_name, params, env) do
    make_gen_call(
      make_member_expression(module_name, function_name, env),
      params
    )
  end

  def make_call_expression(module_name, function_name, params, env) do
    make_gen_call(
      make_member_expression(module_name, function_name, env),
      Enum.map(params, &Translator.translate(&1, env))
    )
  end

  def make_call_expression(function_name, params, env) when is_tuple(function_name) do
    make_gen_call(
      Translator.translate(function_name, env),
      Enum.map(params, &Translator.translate(&1, env))
    )
  end

  def make_call_expression(function_name, params, env) do
    make_gen_call(
      JS.identifier(function_name),
      Enum.map(params, &Translator.translate(&1, env))
    )
  end

  def make_member_expression(module_name, function_name, env, computed \\ false) do
    case module_name do
      modules when is_list(modules) and length(modules) > 1 ->
        ast = make_module_expression_tree(modules, computed, env)
        JS.member_expression(
          ast,
          build_function_name_ast(function_name),
          computed
        )
      modules when is_list(modules) and length(modules) == 1 ->
        JS.member_expression(
          JS.identifier(hd(modules)),
          build_function_name_ast(function_name),
          computed
        )
      {{:., _, [_module_name, _function_name]}, _, _params } = ast ->
        JS.member_expression(
          Translator.translate(ast, env),
          build_function_name_ast(function_name),
          computed                 
        )
      {{:., _, [{:__aliases__, _, _}]}, _, _} = ast ->
        JS.member_expression(
          Translator.translate(ast, env),
          build_function_name_ast(function_name),
          computed                 
        )
      {:., _, _} = ast ->
        JS.member_expression(
          Translator.translate(ast, env),
          build_function_name_ast(function_name),
          computed                 
        )
      _ ->
        JS.member_expression(
          JS.identifier(module_name),
          build_function_name_ast(function_name),
          computed
        )              
    end
  end

  defp build_function_name_ast(function_name) do
    JS.identifier(function_name)
  end

  def filter_name(:in) do
    "__in__"
  end

  def filter_name(name) do
    to_string(name)
    |> String.replace("?", "__qmark__")
    |> String.replace("!", "__emark__")
  end

end
