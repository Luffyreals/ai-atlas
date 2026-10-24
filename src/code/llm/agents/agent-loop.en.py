# A minimal agent: a tool-calling loop, no framework.
import json
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # unset: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
MAX_STEPS = 5  # step cap: the loop never runs forever
NOTES = {"monday": "Read the ReAct paper.", "tuesday": "Write a first agent."}

def tool(name, description):  # describe a tool with JSON Schema
    day = {"type": "string", "enum": list(NOTES)}  # real keys only
    return {"type": "function", "function": {
        "name": name, "description": description,
        "parameters": {"type": "object", "properties": {"day": day},
                       "required": ["day"]}}}

TOOLS = [tool("read_note", "Read the note for a day of the week."),
         tool("delete_note", "Delete the note for a day of the week.")]

def run_tool(name, args):
    if name not in ("read_note", "delete_note"):
        return f"There is no tool named {name}."
    day = args.get("day")  # the model may send a wrong type: check it first
    if not isinstance(day, str) or day not in NOTES:
        return "No note for that day."
    if name == "delete_note":  # a dangerous action: ask a human first
        if input(f"Delete the {day} note? (y/N) ").strip().lower() != "y":
            return "The user refused the deletion."
        del NOTES[day]
        return "Deleted."
    return NOTES[day]

def agent(question):
    messages = [{"role": "user", "content": question}]
    for step in range(MAX_STEPS):
        reply = client.chat.completions.create(  # no tool_choice
            model=MODEL, messages=messages, tools=TOOLS).choices[0].message
        if not reply.tool_calls:  # no tool call: this is the answer
            return reply.content
        messages.append(reply)  # the model's calls must stay in the history
        for call in reply.tool_calls:  # one turn may hold several calls
            try:
                args = json.loads(call.function.arguments)
            except json.JSONDecodeError:
                args = None  # the string is not JSON
            if isinstance(args, dict):
                result = run_tool(call.function.name, args)
            else:  # not JSON, or JSON that is not an object
                result = "Error: arguments must be a valid JSON object."
            print(f"Step {step + 1}: {call.function.name} -> {result}")
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": result})
    return "Stopped: hit the step cap."

print(agent("What is my Tuesday note?"))
