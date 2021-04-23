#include <node/v8.h>
#include <node/node.h>

#include "generate.h"

using namespace v8;

static Handle<Value> GenerateBinding(const Arguments& args) {
	HandleScope scope;

	double r, double i, double z, double d, int w, int h, int t
	generate(
		args[0])->NumberValue(),
		args[1])->NumberValue(),
		args[2])->NumberValue(),
		args[3])->NumberValue(),
		args[4])->IntegerValue(),
		args[5])->IntegerValue(),
		args[6])->IntegerValue()
		);

	return Undefined(Isolate::GetCurrent());
}

Persistent<FunctionTemplate> generateFunction;

extern "C" {
	static void init(Handle<Object> obj) {
		HandleScope scope;
		Local<FunctionTemplate> generateTemplate = FunctionTemplate::New(GenerateBinding);
		generateFunction = Persistent<FunctionTemplate>::New(generateTemplate);
		obj->Set(String::NewSymbol("generate"), generateFunction->GetFunction());
	}
	NODE_MODULE(generate, init)
}