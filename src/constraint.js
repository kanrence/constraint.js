function Linker(val)
{
	var value = val;
	var listener = [];
	this.set_value = function(val,from)
	{
		value = val;
		for(var i = 0,len = listener.length;i < len;i++)
		{
			listener[i](val,from);
		}
	};
	this.get_value = function()
	{
		return value;
	};
	this.observe = function(callback)
	{
		listener.push(callback);
	};
	this.mutable = function()
	{
		return true;
	}
}

function ConstantLinker(val)
{
	if(typeof val == 'undefined')
	{
		throw new Error('ConstantLinker must be new with a val');
		return;
	}
	this.set_value = function()
	{
		throw new Error('ConstantLinker is not mutable');
	}
	this.get_value = function()
	{
		return val;
	}
	this.mutable = function()
	{
		return false;
	}
}

function ConstraintBlock(linkers,op)
{
	var _this = this;
	for(var i = 0,len = linkers.length;i < len;i++)
	{
		if(!linkers[i].mutable()) continue;
		(function(linker)
		{
			linkers[i].observe(function(val,fromblock)
			{
				if(fromblock != _this)
				{
					op.call(_this,linkers,linker)
				}
			});
		})(linkers[i]);
	}
}

function add(a,b,c)
{
	var block = new ConstraintBlock([a,b,c],function(linkers,fromlinker)
	{
		if(fromlinker == linkers[0] && linkers[1].get_value() !== undefined || fromlinker == linkers[1] && linkers[0].get_value() !== undefined)
		{
			linkers[2].set_value(linkers[0].get_value() + linkers[1].get_value(),block);
		}
		else if(fromlinker == linkers[2])
		{
			if(linkers[0].mutable() && !linkers[1].mutable())
			{
				linkers[0].set_value(linkers[2].get_value() - linkers[1].get_value(),block);
			}
			else if(!linkers[0].mutable() && linkers[1].mutable())
			{
				linkers[1].set_value(linkers[2].get_value() - linkers[0].get_value(),block);
			}
		}
	});
}

function mul(a,b,c)
{
	var block = new ConstraintBlock([a,b,c],function(linkers,fromlinker)
	{
		if(fromlinker == linkers[0] && linkers[1].get_value() !== undefined || fromlinker == linkers[1] && linkers[0].get_value() !== undefined)
		{
			linkers[2].set_value(linkers[0].get_value() * linkers[1].get_value(),block);
		}
		else if(fromlinker == linkers[2])
		{
			if(linkers[0].mutable() && !linkers[1].mutable())
			{
				linkers[0].set_value(linkers[2].get_value() / linkers[1].get_value(),block);
			}
			else if(!linkers[0].mutable() && linkers[1].mutable())
			{
				linkers[1].set_value(linkers[2].get_value() / linkers[0].get_value(),block);
			}
		}
	});
}

function not(a,b)
{
	var block = ConstraintBlock([a,b],function(linkers,fromlinker)
	{
		if(linkers[0] != fromlinker)
		{
			linkers[0].set_value(!fromlinker.get_value());
		}
		else
		{
			linkers[1].set_value(!fromlinker.get_value());
		}
	});
}