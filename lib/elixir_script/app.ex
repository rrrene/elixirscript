defmodule ElixirScript.App do
  use Application
  def start(_,_) do
    ElixirScript.App.Sup.start_link
  end

  defmodule Sup do
    use Supervisor
    def start_link do
      Supervisor.start_link(__MODULE__,[])
    end

    def init([]) do
      supervise([
        worker(ElixirScript.JSProcess, [])
      ], 
      strategy: :one_for_one)
    end
  end
end