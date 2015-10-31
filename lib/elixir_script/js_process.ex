defmodule ElixirScript.JSProcess do
  def start_link() do 
    Exos.Proc.start_link("node account.js", [], [cd: "#{:code.priv_dir(:elixir_script)}"], name: __MODULE__)
  end

  def compile(code) do 
    GenServer.cast(__MODULE__, { :code, code } )
    GenServer.call(__MODULE__, :compile, :infinity )
  end
end