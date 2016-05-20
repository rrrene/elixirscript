defmodule ElixirScript.Translator.LexicalScope do

  @type t :: %ElixirScript.Translator.LexicalScope{
    module: atom,
    file: binary,
    line: non_neg_integer,
    function: { atom, non_neg_integer } | nil,
    context: :match | :guard | nil,
    aliases: [{atom, atom}],
    requires: [atom],
    functions: [{atom, [{ atom, non_neg_integer }]}],
    macros: [{atom, [{ atom, non_neg_integer }]}],
    macro_aliases: [{atom, {integer, atom}}],
    context_modules: [atom],
    vars: [{atom, atom | non_neg_integer}],
    export_vars: [{atom, atom | non_neg_integer}] | nil,
    lexical_tracker: nil,
    caller: t | nil,
    env: nil
  }

  defstruct [
    module: nil,
    file: nil,
    line: 0,
    function: nil,
    context: nil,
    aliases: [],
    requires: [],
    functions: [],
    macros: [],
    macro_aliases: [],
    context_modules: [],
    vars: [],
    export_vars: nil,
    lexical_tracker: nil,
    caller: nil,
    env: nil
  ]


  def env(scope) do
    #TODO: make Macro.Env from scope
  end


end
