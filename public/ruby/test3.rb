class Person
  attr_reader :name, :age
  def initialize(name, age)
    @name, @age = name, age
  end
  def <=>(person) # Comparison operator for sorting
    @age <=> person.age
  end
  def to_s
    "#@name (#@age)"
  end
end

group = [
  Person.new("Bob", 33),
  Person.new("Chris", 16),
  Person.new("Ash", 23)
]

a = [1, 'hi', 3.14, 1, 2, [4, 5]]
b = a.reverse
c = a.flatten.uniq
hash = { :water => 'wet', :fire => 'hot' }
x = 10
y = 20
z = x + y
puts c[2]